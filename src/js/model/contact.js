class Contact {

    id;
    firstName;
    lastName;
    middleName;
    birthAt;
    photo = [];
    email;
    phone;
    messengers = {};

    post;
    city;

    /** @type {[Product]} */
    products = [];

    resumeDownloadUrl = '';

    /**
     * @returns {string}
     */
    getFullName() {
        return [
            this.lastName,
            this.firstName,
            this.middleName,
        ].join(' ').trim();
    }

    /**
     * @param type {string}
     * @param name {string}
     */
    addMessenger(type, name) {
        this.messengers[type] = name;
    }

    /**
     *
     * @param fileName {string}
     * @param fileData {string}
     */
    setPhoto(fileName, fileData) {
        this.photo = [fileName, fileData];
    }

    /**
     * @returns {boolean}
     */
    isValid() {
        if (!this.firstName) {
            return false;
        }
        if (!this.lastName) {
            return false;
        }
        if (!this.email && !this.phone) {
            return false;
        }
        return true;
    }
}