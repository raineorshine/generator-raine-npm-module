#! /usr/bin/env node

import * as com from 'commander'
import * as stdin from 'get-stdin-promise'
import * as pkg from './package.json'
import <%=camelize(project)%> from '<%=project%>'

const extendedHelp = `

${pkg.description}

Here is an example:
$ blah blah blah`

com
  .version(pkg.version)
  .usage(extendedHelp)
  .parse(process.argv)

stdin.then(input => {
  console.log(<%=camelize(project)%>(input))
})
