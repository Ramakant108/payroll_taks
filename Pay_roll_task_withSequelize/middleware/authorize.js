const { ForbiddenError } = require('../utils/customError');
const db = require('../models');

// permissions: array of required permission names, e.g. ['admin', 'recruiter:manage_jobs']
function authorize(permissions = []) {
  return async (req, res, next) => {
    try {
      if (!req.userId || !req.roleId) {
        throw new ForbiddenError('unauthorized');
      }

      // if no specific permissions required just continue
      if (!permissions.length) {
        return next();
      }

      const role = await db.role.findOne({
        where: {
          id: req.roleId,
          deleted: false,
        },
        include: [
          {
            model: db.permission,
            as: 'permissions',
            required: false,
            where: {
              deleted: false,
            },
            through: {
              where: {
                deleted: false,
              },
            },
          },
        ],
      });

      if (!role) {
        throw new ForbiddenError('you do not have permission to access this resource');
      }

      const userPermissions = (role.permissions || []).map((p) => p.name);
      const hasAllPermissions = permissions.every((p) => userPermissions.includes(p));

      if (!hasAllPermissions) {
        throw new ForbiddenError('you do not have permission to access this resource');
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = authorize;

