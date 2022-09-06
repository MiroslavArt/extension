class ParserLinkedIn extends ParserAbstract {

    defaultClientAge = 30;
    photoFilename = 'photo.jpg';
    resumeFileName;

    publicIdentifier;
    versionTag;

    /**
     * @returns {Promise<null|Contact>}
     */
    async parse() {
        let codeElements = this.$document.filter("code[id^='bpr-guid-']");

        let contact = new Contact();

        let urlParts = window.location.href.match(/https:\/\/www\.linkedin\.com\/in\/(.+)\//);
        this.publicIdentifier = decodeURI(urlParts[1]);
        if (!this.publicIdentifier) {
            return null;
        }

        let photoFileUrl = '';
        jQuery.each(codeElements, (k, element) => {

            let json = JSON.parse(jQuery(element).text());

            if (typeof json.data === 'undefined') {
                return;
            }

            if (typeof json.data.$type !== 'undefined'
                && json.data.$type === 'com.linkedin.voyager.identity.profile.VersionTag') {
                this.versionTag = json.data.versionTag;
            }

            if (typeof json.data['*profile'] !== 'undefined' && typeof json.included !== 'undefined') {

                jQuery.each(json.included, (k, element) => {

                    if (element.publicIdentifier === this.publicIdentifier) {
                        if (element.$type === "com.linkedin.voyager.identity.shared.MiniProfile") {

                            contact.firstName = latinToCyrillic(element.firstName);
                            contact.lastName = latinToCyrillic(element.lastName);

                            if (typeof element.picture !== 'undefined' && element.picture !== null) {
                                photoFileUrl = element.picture.rootUrl
                                    + element.picture.artifacts.pop().fileIdentifyingUrlPathSegment;
                            }
                        }
                    }

                    if (element.$type === "com.linkedin.voyager.identity.profile.Profile") {
                        contact.post = element.headline;
                        contact.city = element.locationName;
                    }

                    if (element.$type === 'com.linkedin.voyager.identity.profile.Skill') {
                        if (element.name.toLowerCase()) {
                            contact.products.push(new Product(0, element.name.toLowerCase()));
                        }
                    }
                });
            }
        });

        let profileContactInfo = await this.loadProfileContactInfo();

        contact.email = profileContactInfo.emailAddress;
        if (typeof profileContactInfo.birthDateOn !== 'undefined'
            && typeof profileContactInfo.birthDateOn.month !== 'undefined'
            && typeof profileContactInfo.birthDateOn.day !== 'undefined') {
            contact.birthAt = [
                (new Date().getFullYear()) - this.defaultClientAge,
                (profileContactInfo.birthDateOn.month > 9 ? '' : '0') + profileContactInfo.birthDateOn.month,
                (profileContactInfo.birthDateOn.day > 9 ? '' : '0') + profileContactInfo.birthDateOn.day,
            ].join('-');
        }

        if (typeof profileContactInfo.ims !== 'undefined') {
            jQuery.each(profileContactInfo.ims, (k, im) => {
                contact.addMessenger(im.provider, im.id);
            });
        }

        if (typeof profileContactInfo.phoneNumbers !== 'undefined') {
            jQuery.each(profileContactInfo.phoneNumbers, (k, phone) => {
                contact.phone = phone.number;
            });
        }

        if (typeof profileContactInfo.twitterHandles !== 'undefined') {
            jQuery.each(profileContactInfo.twitterHandles, (k, twitter) => {
                contact.addMessenger('TWITTER', twitter.name);
            });
        }

        let photoFileData = '';
        if (photoFileUrl.length) {
            photoFileData = await convertFileToBase64(photoFileUrl);
            contact.setPhoto(this.photoFilename, photoFileData)
        }

        this.resumeFileName = contact.getFullName().replace(' ', '_');

        return contact;
    }

    /**
     * @returns {Promise<Promise|Promise|Promise|Promise>}
     */
    async loadProfileContactInfo() {
        let url = 'https://www.linkedin.com/voyager/api/identity/profiles/'
            + this.publicIdentifier + '/profileContactInfo';

        return new Promise((resolve, reject) => {
            let headers = {'csrf-token': getCookie('JSESSIONID')};
            jQuery.ajaxSetup({headers: headers});
            jQuery.get(url, {})
                .done((data) => {
                    resolve(data);
                })
                .fail((data) => {
                    alert('Ошибка получения контактной информации: '
                        + data.status + ' ' + data.statusText);
                });
        });
    }

    /**
     * @returns {Promise<Promise|Promise|Promise|Promise>}
     */
    async getResumeUploadUrl() {

        let url = 'https://www.linkedin.com/voyager/api/identity/profiles/'
            + this.publicIdentifier + '/profileActions?versionTag='
            + this.versionTag + '&action=saveToPdf';

        return new Promise((resolve, reject) => {
            let headers = {'csrf-token': getCookie('JSESSIONID')};
            jQuery.ajaxSetup({headers: headers});
            jQuery.post(url, {})
                .done((data) => {
                    resolve({
                        url: data.value,
                        name: createUniqFilename(this.resumeFileName, 'pdf'),
                    });
                })
                .fail((data) => {
                    alert('Ошибка получения ссылки на файл резюме: '
                        + data.status + ' ' + data.statusText);
                });
        });
    }
}