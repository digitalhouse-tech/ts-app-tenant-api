const request = require('supertest')
const path = require('path')
const { expect } = require('chai')

const YAML = require('yamljs')
const env = YAML.load(
    path.resolve(process.cwd(), 'environment', process.env.NODE_ENV, 'e2e.yml')
)

describe('[e2e] testing', function () {
    this.timeout(5000)

    const server = request(env.API_URL)

    it('[GET] /{id}', (done) => {
        server
            .get(`/${env.RESOURCE_ID}`)
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                expect(res.body.data._id).to.be.equal(env.RESOURCE_ID)
                done()
            })
            .catch(console.log)
    })

    it('[GET] /host/{name}', (done) => {
        server
            .get(`/host/${encodeURIComponent(env.RESOURCE_HOSTNAME)}`)
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                expect(res.body.data._id).to.be.equal(env.RESOURCE_ID)
                expect(res.body.data.host).to.be.equal(
                    env.RESOURCE_HOSTNAME
                )
                done()
            })
            .catch(console.log)
    })

    it('[GET] /host/{name}/strategies', (done) => {
        server
            .get(
                `/host/${encodeURIComponent(
                    env.RESOURCE_HOSTNAME
                )}/strategies`
            )
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                expect(Array.isArray(res.body.data)).to.be.true
                done()
            })
            .catch(console.log)
    })
})
