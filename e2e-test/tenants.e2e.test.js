const request = require('supertest')
const path = require('path')
const { expect } = require('chai')

require('dotenv').config()

describe('[e2e] testing', function () {
    this.timeout(5000)

    const server = request(process.env.API_URL)

    it('[GET] /{id}', (done) => {
        server
            .get(`/${process.env.E2E_RESOURCE_ID}`)
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                expect(res.body.data._id).to.be.equal(process.env.E2E_RESOURCE_ID)
                done()
            })
            .catch(console.log)
    })

    it('[GET] /host/{name}', (done) => {
        server
            .get(`/host/${encodeURIComponent(process.env.E2E_RESOURCE_HOSTNAME)}`)
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                expect(res.body.data._id).to.be.equal(process.env.E2E_RESOURCE_ID)
                expect(res.body.data.host).to.be.equal(
                    process.env.E2E_RESOURCE_HOSTNAME
                )
                done()
            })
            .catch(console.log)
    })

    it('[GET] /host/{name}/strategies', (done) => {
        server
            .get(
                `/host/${encodeURIComponent(
                    process.env.E2E_RESOURCE_HOSTNAME
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
