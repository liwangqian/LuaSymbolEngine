--- Reading and querying simple tabular data.
--
--    data.read 'test.txt'
--    ==> {{10,20},{2,5},{40,50},fieldnames={'x','y'},delim=','}
--
-- Provides a way of creating basic SQL-like queries.
--
--    require 'pl'
--    local d = data.read('xyz.txt')
--    local q = d:select('x,y,z where x > 3 and z < 2 sort by y')
--    for x,y,z in q do
--        print(x,y,z)
--    end
--
-- See @{06-data.md.Reading_Columnar_Data|the Guide}
--
-- Dependencies: `pl.utils`, `pl.array2d` (fallback methods)
-- @module pl.data
module('drv_base')

local x = 123
