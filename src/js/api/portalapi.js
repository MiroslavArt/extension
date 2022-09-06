class PortalApi {

    // test
    // config = {
    //     baseUrl: 'https://85.143.221.234/rest/1/1a26apiu8fc6r9q0',
    //     resumeFolderId: 188,
    //     listsIblockTypeId: 'lists_socnet',
    //     productsIblockId: 47,
    // };

    // prod
    config = {
        baseUrl: 'https://bx.skillscloud.com/rest/1/1a26apiu8fc6r9q0',
        resumeFolderId: 188,
        listsIblockTypeId: 'lists_socnet',
        productsIblockId: 47,
    };

    urls = {
        'lists.element.get': this.config.baseUrl + '/lists.element.get',
        'crm.contact.list': this.config.baseUrl + '/crm.contact.list',
        'disk.folder.uploadfile': this.config.baseUrl + '/disk.folder.uploadfile',
        'crm.contact.update': this.config.baseUrl + '/crm.contact.update',
        'crm.contact.add': this.config.baseUrl + '/crm.contact.add',
    };

    /**
     * @type {ContactTransformer}
     */
    transformer;

    /**
     * @param transformer {ContactTransformer}
     */
    constructor(transformer) {
        this.transformer = transformer;
    }

    /**
     * @returns {Promise<Promise>}
     */
    async findProducts() {
        const url = this.urls['lists.element.get'];
        let params = {
            IBLOCK_TYPE_ID: this.config.listsIblockTypeId,
            IBLOCK_ID: this.config.productsIblockId,
        };

        return new Promise(function (resolve, reject) {
            jQuery.post(url, params)
                .done(function (data) {

                    let productMap = {};
                    jQuery.each(data.result, function (k, element) {
                        productMap[element['ID']] = element['NAME'];
                    });

                    resolve(productMap);
                })
                .fail(function (data) {
                    alert('Ошибка получения продуктов: '
                        + data.status + ' ' + data.statusText);
                });
        });
    }

    /**
     * @param contact {Contact}
     * @returns {Promise<{id}|*>}
     */
    async findContact(contact) {
        if (contact.phone) {
            let portalContact = await this.findContactByFilter({"PHONE": contact.phone});
            if (portalContact.id) {
                return portalContact;
            }
        }
        if (contact.email) {
            let portalContact = await this.findContactByFilter({"EMAIL": contact.email});
            if (portalContact.id) {
                return portalContact;
            }
        }
        return await this.findContactByFilter({"NAME": contact.firstName, "LAST_NAME": contact.lastName});
    }

    /**
     * @param filter {array}
     * @returns {Promise<Promise|Promise|Promise|Promise>}
     */
    async findContactByFilter(filter) {
        const url = this.urls['crm.contact.list'];
        let params = {
            select: [
                "*",
                "PHONE",
                "EMAIL",
                "UF_CRM_1566676707", // product
                "UF_CRM_1566678017", // module
            ],
            filter: filter
        };
        let self = this;
        return new Promise(function (resolve, reject) {
            jQuery.post(url, params)
                .done(function (data) {
                    if (("result" in data) && data.result.length > 0 && "ID" in data.result[0]) {
                        resolve(self.transformer.fromArray(data.result[0]));
                    } else {
                        resolve(new Contact());
                    }
                })
                .fail(function (data) {
                    alert('Ошибка получения контакта: '
                        + data.status + ' ' + data.statusText);
                });
        });
    }

    /**
     * @param fileUrl {string}
     * @param name {string}
     * @returns {Promise<Promise|Promise|Promise|Promise>}
     */
    async uploadResumeFile(fileUrl, name) {

        let fileContent = await convertFileToBase64(fileUrl);

        const url = this.urls['disk.folder.uploadfile'];
        let uploadFields = {
            id: this.config.resumeFolderId,
            data: {NAME: name},
            fileContent: fileContent,
        };
        return new Promise(function (resolve, reject) {
            jQuery.post(url, uploadFields)
                .done(function (data) {
                    let detailUrl = '';
                    if (typeof data.result !== 'undefined') {
                        detailUrl = data.result.DETAIL_URL;
                    }
                    resolve(detailUrl);
                })
                .fail(function (data) {
                    let responseText = JSON.parse(data.responseText);
                    alert('Ошибка сохранения контакта: '
                        + data.status + ': ' + data.statusText + '. ' + responseText.error_description);
                });
        });
    }

    /**
     * @param contact {Contact}
     * @returns {Promise<Promise|Promise|Promise|Promise>}
     */
    async saveContact(contact) {
        const url = contact.id
            ? this.urls['crm.contact.update']
            : this.urls['crm.contact.add'];

        let contactData = this.transformer.toArray(contact);
        return new Promise(function (resolve, reject) {
            jQuery.post(url, contactData)
                .done(function (data) {
                    resolve((contact.id ? contact.id : data.result));
                })
                .fail(function (data) {
                    let responseText = JSON.parse(data.responseText);
                    alert('Ошибка сохранения контакта: '
                        + data.status + ': ' + data.statusText + '. ' + responseText.error_description);
                });
        });
    }
}