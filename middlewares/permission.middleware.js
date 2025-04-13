const User = require('../models/User');
const Permission = require('../models/Permission');
const checkPermission = (action, module) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.userId).populate({
        path: 'role',
        populate: {
          path: 'permissions',
        },
      });

      if (!user || !user.role) {
        return res.status(403).json({ message: 'Access denied. Role not found.' });
      }

      const hasPermission = user.role.permissions.some(
        (perm) => perm.action === action && perm.module === module
      );

      if (!hasPermission) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permission.' });
      }

      next();
    } catch (err) {
      console.error('Permission check failed:', err.message);
      return res.status(500).json({ message: 'Internal server error during permission check.' });
    }
  };
};

module.exports = checkPermission;
