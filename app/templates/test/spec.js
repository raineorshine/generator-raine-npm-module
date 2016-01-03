var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
var should = chai.should()
var <%=camelize(project)%> = require('../index.js')

chai.use(chaiAsPromised)

describe('doSomething', function () {
  it('should do something', function () {
    <%=camelize(project)%>.doSomething().should.equal(12345)
  })
})
