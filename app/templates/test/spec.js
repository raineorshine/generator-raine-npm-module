import * as chai from 'chai'
import <%=camelize(project)%> from '../<%=babel ? 'src/' : ''%>index.js'
const should = chai.should()

describe('<%=camelize(project)%>', () => {
  it('should do something', () => {
    <%=camelize(project)%>.doSomething().should.equal(12345)
  })
})
