class ParserAbstract {
    $document;
    products;

    /**
     * @param $document
     */
    setDocument($document) {
        this.$document = $document;
    }

    /**
     * @param products
     */
    setProducts(products) {
        this.products = products;
    }

    parse() {
    }

    getResumeUploadUrl() {
    }
}