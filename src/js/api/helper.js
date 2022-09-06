/**
 * @param url {string}
 * @returns {Promise|Promise|Promise|Promise}
 */
function convertFileToBase64(url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.onload = function () {
            let reader = new FileReader();
            reader.onloadend = function () {
                let data = reader.result.split(',');
                resolve(data[1]);
            };
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    });
}

/**
 * @param string {string}
 * @returns {string}
 */
function latinToCyrillic(string) {
    if (!(/[A-Za-z ]/g).test(string)) {
        return string;
    }
    let rus = ['Я', 'я', 'Ю', 'ю', 'Ч', 'ч', 'Ш', 'ш', 'Щ', 'щ', 'Ж', 'ж', 'А', 'а', 'Б', 'б', 'В', 'в', 'Г', 'г',
        'Д', 'д', 'Е', 'е', 'Ё', 'ё', 'З', 'з', 'И', 'и', 'Й', 'й', 'К', 'к', 'Л', 'л', 'М', 'м', 'Н', 'н', 'О', 'о',
        'П', 'п', 'Р', 'р', 'С', 'с', 'Т', 'т', 'У', 'у', 'Ф', 'ф', 'Х', 'х', 'Ц', 'ц', 'Ы', 'ы', 'Ь', 'ь', 'Ъ', 'ъ',
        'Э', 'э'];
    let eng = ['Ya', 'ya', 'Yu', 'yu', 'Ch', 'ch', 'Sh', 'sh', 'Sh', 'sh', 'Zh', 'zh', 'A', 'a', 'B', 'b', 'V', 'v',
        'G', 'g', 'D', 'd', 'E', 'e', 'E', 'e', 'Z', 'z', 'I', 'i', 'J', 'j', 'K', 'k', 'L', 'l', 'M', 'm', 'N', 'n',
        'O', 'o', 'P', 'p', 'R', 'r', 'S', 's', 'T', 't', 'U', 'u', 'F', 'f', 'H', 'h', 'C', 'c', 'Y', 'y', '`', '`',
        '\'', '\'', 'E', 'e'];
    for (let i = 0; i < eng.length; i++) {
        let reg = new RegExp(eng[i], "g");
        string = string.replace(reg, rus[i]);
    }
    return string;
}

/**
 * @param delimiter {string}
 * @returns {string}
 */
function nowDateString(delimiter) {
    if (!delimiter) {
        delimiter = '';
    }
    let date = new Date();
    let mm = date.getMonth() + 1;
    let dd = date.getDate();
    let hh = date.getHours();
    let ii = date.getMinutes();
    let ss = date.getSeconds();
    return [date.getFullYear(),
        (mm > 9 ? '' : '0') + mm,
        (dd > 9 ? '' : '0') + dd,
        '_',
        (hh > 9 ? '' : '0') + hh,
        (ii > 9 ? '' : '0') + ii,
        (ss > 9 ? '' : '0') + ss,
    ].join(delimiter);
}

// /**
//  * @param url {string}
//  * @returns {string}
//  */
// function baseName(url) {
//     return url.split('/').pop().split('#')[0].split('?')[0];
// }

/**
 * @param name {string}
 * @param extension {string}
 * @returns {string}
 */
function createUniqFilename(name, extension) {
    return name + '_' + nowDateString() + '.' + extension;
}

/**
 * @param name {string}
 * @returns {string}
 */
function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    matches[1] = matches[1].replace(new RegExp("^[\"]+|[\"]+$", "g"), "");
    return matches ? decodeURIComponent(matches[1]) : undefined;
}