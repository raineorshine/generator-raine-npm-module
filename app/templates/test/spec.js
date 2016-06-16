import * as chai from 'chai'
import * as <%=camelize(project)%> from '../index.js'
const should = chai.should()

describe('<%=camelize(project)%>', () => {
  it('should do something', () => {
    <%=camelize(project)%>.doSomething().should.equal(12345)
  })
})
