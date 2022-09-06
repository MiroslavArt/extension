chrome.runtime.sendMessage({
    source: controller(document)
});

/**
 * @param documentRoot
 * @returns {Promise<void>}
 */
async function controller(documentRoot) {

    let parser = parserFactory(window.location.href);
    if (parser === null) {
        alert('Страница с резюме не найдена');
        return;
    }

    let $document = jQuery(buildDom(documentRoot));
    parser.setDocument($document);

    let transformer = new ContactTransformer();
    let api = new PortalApi(transformer);

    let productsMap = await api.findProducts();
    transformer.setProductsMap(productsMap);

    let contact = await parser.parse();

    if (contact === null) {
        alert('Ошибка данных контакта');
        return;
    }
    if (!contact.isValid()) {
        alert('Ошибка данных контакта:\n' + transformer.toBriefArray(contact).join('\n'));
        return;
    }

    let portalContact = await api.findContact(contact);
    if (portalContact.id) {
        let msg = 'Найден контакт #' + portalContact.id + '.\n'
            + transformer.toBriefArray(portalContact).join('\n') + '.\n\n'
            + 'Нажмите "OK", для обновления контакта.';
        if (confirm(msg)) {
            contact.id = portalContact.id;
        } else {
            if (!confirm('Для добавления контакта нажмите "OK"')) {
                return;
            }
        }
    }

    let resumeUpload = await parser.getResumeUploadUrl();
    if (resumeUpload.url) {
        contact.resumeDownloadUrl = await api.uploadResumeFile(resumeUpload.url, resumeUpload.name);
    }

    let responseId = await api.saveContact(contact);
    if (responseId) {
        alert('Контакт #' + responseId + ' сохранен');
    }
}

function buildDom(documentRoot) {
    let html = '';
    let node = documentRoot.firstChild;

    while (node) {
        switch (node.nodeType) {
            case Node.ELEMENT_NODE:
                html += node.outerHTML;
                break;
            case Node.TEXT_NODE:
                html += node.nodeValue;
                break;
            case Node.CDATA_SECTION_NODE:
                html += '<![CDATA[' + node.nodeValue + ']]>';
                break;
            case Node.COMMENT_NODE:
                html += '<!--' + node.nodeValue + '-->';
                break;
            case Node.DOCUMENT_TYPE_NODE:
                // (X)HTML documents are identified by public identifiers
                html += "<!DOCTYPE " + node.name + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '') + (!node.publicId && node.systemId ? ' SYSTEM' : '') + (node.systemId ? ' "' + node.systemId + '"' : '') + '>\n';
                break;
        }
        node = node.nextSibling;
    }
    return html;
}

function parserFactory(currentUrl) {
    let patternHh1 = /^https:\/\/.+\.hh\.ru\/resume\/.+/;
    let patternHh2 = /^https:\/\/hh\.ru\/resume\/.+/;
    if (currentUrl.match(patternHh1) || currentUrl.match(patternHh2)) {
        return new ParserHh();
    }

    let patternIn1 = /^https:\/\/www.linkedin.com\/in\/.+\/detail\/contact-info\//;
    let patternIn2 = /^https:\/\/www.linkedin.com\/in\/.+\//;
    if (currentUrl.match(patternIn1) || currentUrl.match(patternIn2)) {
        return new ParserLinkedIn();
    }
    return null;
}