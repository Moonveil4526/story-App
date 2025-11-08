const UrlParser = {
  parseActiveUrlWithCombiner() {
    const url = window.location.hash.slice(1).toLowerCase();
    const splittedUrl = this._urlSplitter(url);
    return this._urlCombiner(splittedUrl);
  },

  _urlSplitter(url) {
    const urlParts = url.split('/');
    return {
      resource: urlParts[1] || null,
      id: urlParts[2] || null,
      verb: urlParts[3] || null,
    };
  },

  _urlCombiner(splittedUrl) {
    return splittedUrl.resource ? `/${splittedUrl.resource}` : '/';
  },
};

export default UrlParser;
