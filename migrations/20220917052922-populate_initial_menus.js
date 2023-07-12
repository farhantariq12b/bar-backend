const logger = require('../src/helpers/logger');

module.exports = {
  async up(db /* client */) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    const MenusArray = [
      { name: 'Home', url: '/' },
      { name: 'Products', url: '/products' },
      { name: 'Industries', url: '/industries' },
      { name: 'Custom Boxes', url: '/custom-boxes' },
      { name: 'Portfolio', url: '/portfolio' },
      { name: 'Blog', url: '/portfolio' },
      { name: 'Contact Us', url: '/contact-us' },
    ];
    const menuCount = await db.collection('menu').count();
    logger.info(menuCount);
    if (menuCount) {
      return menuCount;
    }
    return db.collection('menu').insertMany(MenusArray, (err) => {
      if (err) {
        logger.error('Menu Creation Error');
      }
      logger.info('Menus inserted');
    });
  },

  async down(/* db, client */) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
