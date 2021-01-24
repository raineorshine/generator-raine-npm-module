const assert = require('assert')
>> if(options.babel) {
import * as chai from 'chai'
import <%=camelize(project)%> from '../<%=options.babel ? 'src/' : ''%>index.js'
>> } else {
const chai = require('chai')
const <%=camelize(project)%> = require('../<%=options.babel ? 'src/' : ''%>index.js')
>> }

describe('<%=project%>', () => {
  it('should do something', () => {
    assert.equal(<%=camelize(project)%>(), 12345)
  })
})
