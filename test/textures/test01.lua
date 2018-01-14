local y = 1
local x = 'abc'

local i = {
    a = 1,
    b = 'x'
}

function i:getA()
    return self.a
end

return i
