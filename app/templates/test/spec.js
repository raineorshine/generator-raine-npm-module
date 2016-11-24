>> if(babel) {
import * as chai from 'chai'
import <%=camelize(project)%> from '../<%=babel ? 'src/' : ''%>index.js'
>> } else {
const chai = require('chai')
const <%=camelize(project)%> = require('../<%=babel ? 'src/' : ''%>index.js')
>> }
const should = chai.should()

describe('<%=project%>', () => {
  it('should do something', () => {
    <%=camelize(project)%>().should.equal(12345)
  })
})
