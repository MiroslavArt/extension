class ParserHh extends ParserAbstract {

    photoFilename = 'photo.jpg';

    resumeUrlHash;
    resumeFileName;

    /**
     * @returns {Promise<null|Contact|Contact|Contact|Contact>}
     */
    async parse() {

        let $initialStateElement = this.$document.filter('#HH-Lux-InitialState');
        let initialState = JSON.parse($initialStateElement.html());

        let config = initialState.config;
        let resume = initialState.resume;
        if (!resume) {
            return null;
        }

        let contact = new Contact();
        contact.firstName = latinToCyrillic(resume.firstName.value);
        contact.lastName = latinToCyrillic(resume.lastName.value);
        contact.middleName = latinToCyrillic((resume.middleName.value ? resume.middleName.value : ''));
        contact.email = resume.email.value;
        contact.post = resume.title.value.replace(/&amp;/g, '&');
        contact.birthAt = (resume.birthday.value ? resume.birthday.value : '');
        contact.city = resume.area.value.title;

        let photoFileUrl = '';
        jQuery.each(resume.photoUrls.value, function (k, photoUrl) {
            photoFileUrl = config.hhcdnHost + photoUrl.big.replace(/&amp;/g, '&');
        });
        let photoFileData = await convertFileToBase64(photoFileUrl);
        contact.setPhoto(this.photoFilename, photoFileData);

        jQuery.each(resume.phone.value, function (k, phone) {
            contact.phone = phone.raw;
        });

        jQuery.each(resume.personalSite.value, function (k, site) {
            let identy = site.text ? site.text : site.url;
            contact.addMessenger(site.type.toUpperCase(), identy);
        });

        jQuery.each(resume.keySkills.value, function (k, skillData) {
            let skill = skillData.string;
            contact.products.push(new Product(0, skill.toLowerCase()));
        });
        jQuery.each(resume.advancedKeySkills.value, function (k, skillData) {
            contact.products.push(new Product(0, skillData.name.toLowerCase()));
        });

        this.resumeFileName = contact.getFullName().replace(' ', '_');
        this.resumeUrlHash = resume.hashFromURL;

        return contact;
    }

    /**
     * @returns {Promise<{name: string, url: string}>}
     */
    async getResumeUploadUrl() {
        return {
            'url': '/resume_converter/' + this.resumeFileName + '.pdf?hash=' + this.resumeUrlHash + '&type=pdf',
            'name': createUniqFilename(this.resumeFileName, 'pdf'),
        };
    }
}

