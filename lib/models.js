const Knex = require('knex');
const knexConfig = require('../knexfile');

const { Model } = require('objection');

// Initialize knex.
const knex = Knex(knexConfig);

// Bind all Models to the knex instance. You only
// need to do this once before you use any of
// your model classes.
Model.knex(knex);

class Website extends Model {
    static get tableName() {
        return 'websites'
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name', 'url'],

            properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                url: { type: 'string' },
                emails: { type: 'array' }
            }
        }
    }

    static get relationMappings() {
        return {
            pingChecks: {
                relation: Model.HasManyRelation,
                modelClass: PingCheck,
                join: {
                    from: 'websites.id',
                    to: 'pingChecks.websiteId'
                }
            }
        }
    }
}

class PingCheck extends Model {
    static get tableName() {
        return 'pingChecks'
    }

    static get modifiers() {
        return {
            latest(builder) {
                builder.orderBy('timestamp', 'desc').limit(1).select('responseTime', 'status', 'timestamp')
            },
            latestThree(builder) {
                builder.orderBy('timestamp', 'desc').limit(3).select('responseTime', 'status', 'timestamp')
            }
        }
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['websiteId', 'timestamp', 'responseTime', 'status'],

            properties: {
                id: { type: 'integer' },
                websiteId: { type: 'integer' },
                timestamp: { type: 'datetime' },
                responseTime: { type: 'float'},
                response: { type: 'string'},
                status: { type: 'string' },
                screenshot: { type: 'binary' }
            }
        }
    }

    static get relationMappings() {
        return {
            website: {
                relation: Model.BelongsToOneRelation,
                modelClass: Website,
                join: {
                    from: 'pingChecks.websiteId',
                    to: 'websites.id'
                }
            }
        }
    }
}

module.exports = {
    Website,
    PingCheck
}
