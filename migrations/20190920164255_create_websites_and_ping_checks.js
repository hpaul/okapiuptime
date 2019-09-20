
exports.up = function(knex) {
    return knex.schema
        .createTable('websites', table => {
            table.increments('id').primary();
            table.string('name');
            table.string('url');
            table.json('emails');
        })
        .createTable('pingChecks', table => {
            table.increments('id').primary();
            table
                .integer('websiteId')
                .unsigned()
                .references('id')
                .inTable('websites')
                .onDelete('SET NULL')
                .index();
            table.datetime('timestamp').defaultTo(knex.fn.now())
            table.float('responseTime')
            table.text('response')
            table.string('status')
            table.binary('screenshot')
        })
};

exports.down = function(knex) {
    knex.schema
        .dropTableIfExists('websites')
        .dropTableIfExists('pingChecks');
};
