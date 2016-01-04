var chai = require('chai')
var should = chai.should()
var <%=camelize(project)%> = require('../index.js')

describe('<%=camelize(project)%>', function () {
  it('should do something', function () {
    <%=camelize(project)%>.doSomething().should.equal(12345)
  })
})
