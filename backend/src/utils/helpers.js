module.exports = {
    formatDate: (date) => new Date(date).toLocaleDateString('en-UG'),
    generateSlug: (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
};