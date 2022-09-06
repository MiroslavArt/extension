class ContactTransformer {

    productsMap;

    setProductsMap(map) {
        this.productsMap = map;
    }

    /**
     * @param contact {Contact}
     * @returns {{fields: {SECOND_NAME: *, UF_CRM_1563983113: *, IM: string, POST: *, UF_CRM_1566036655: *, PHONE: {VALUE: *, VALUE_TYPE: string}[], UF_CRM_1566676707: *, PHOTO: {fileData: *}, BIRTHDATE: *, LAST_NAME: *, EMAIL: {VALUE: *, VALUE_TYPE: string}[], NAME: *}}}
     */
    toArray(contact) {
        let self = this;
        let response = {
            'fields': {
                "NAME": contact.firstName,
                "SECOND_NAME": contact.middleName,
                "LAST_NAME": contact.lastName,
                "EMAIL": [
                    {
                        "VALUE": contact.email,
                        "VALUE_TYPE": "WORK"
                    }
                ],
                "PHONE": [
                    {
                        "VALUE": contact.phone,
                        "VALUE_TYPE": "WORK"
                    }
                ],
                "PHOTO": {
                    "fileData": contact.photo
                },
                "IM": "",
                "BIRTHDATE": contact.birthAt,
                "POST": contact.post,
                "UF_CRM_1566036655": contact.city,
                "UF_CRM_1563983113": contact.resumeDownloadUrl,
            }
        };

        if (contact.products) {
            let productIds = [];
            response['fields']['UF_CRM_1566676707'] = [];
            jQuery.each(contact.products, (k, product) => {
                jQuery.each(self.productsMap, function (id, name) {
                    if (name.toLowerCase() === product.name.toLowerCase()) {
                        productIds.push(id);
                    }
                });
            });
            response['fields']['UF_CRM_1566676707'] = [...new Set(productIds)];
        }

        if (contact.messengers) {
            response['fields']['IM'] = [];
            jQuery.each(contact.messengers, (type, name) => {
                response['fields']['IM'].push({"VALUE": name, "VALUE_TYPE": type});
            });
        }

        if (contact.id) {
            response['id'] = contact.id;
        }

        return response;
    }

    /**
     * @param contactData {*}
     * @returns {Contact}
     */
    fromArray(contactData) {
        console.log(contactData);
        let self = this;

        let contact = new Contact();
        contact.id = contactData.ID;
        contact.lastName = contactData.LAST_NAME;
        contact.firstName = contactData.NAME;
        contact.post = contactData.POST;

        jQuery.each(contactData.UF_CRM_1566676707, function (i, productId) {
            if (self.productsMap[productId]) {
                contact.products.push(new Product(productId, self.productsMap[productId]));
            }
        });

        jQuery.each(contactData.EMAIL, function (k, email) {
            contact.email = email.VALUE;
        });
        jQuery.each(contactData.PHONE, function (k, phone) {
            contact.phone = phone.VALUE;
        });
        return contact;
    }

    /**
     * @param contact {Contact}
     * @returns {*[]}
     */
    toBriefArray(contact) {

        let productsInfo = Object.values(contact.products)
            .map(function (element) {
                return element.name;
            }).join(', ');
        if (!productsInfo) {
            productsInfo = 'отсутствуют';
        }

        return [
            'Имя: ' + contact.firstName,
            'Фамилия: ' + contact.lastName,
            'Email: ' + contact.email,
            'Телефон: ' + contact.phone,
            'Продукты: ' + productsInfo,
        ];
    }
}