'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pre = function pre() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];

  switch (action.type) {
    case 'SET_PRE':
      return (0, _extends3.default)({}, state, action.payload);
    default:
      return state;
  }
};

exports.default = pre;
module.exports = exports['default'];
//# sourceMappingURL=pre.js.map