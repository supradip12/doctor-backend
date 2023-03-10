import jwt from "jsonwebtoken";

export const verifydocToken = (req, res, next) => {
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SCRET_KEY, (err, doctor) => {
      if (err) res.status(403).json("Token is not valid!");
      req.doctor = doctor;
      next();
    });
  } else {
    return res.status(401).json("You are not authenticated!");
  }
};

export const verifyTokenAndAuthorization = (req, res, next) => {
  verifydocToken(req, res, () => {
    if (req.doctor.id === req.params.id || req.doctor.isDoctor) {
      next();
    } else {
      res.status(403).json("You are not alowed to do that!");
    }
  });
};

// export const verifyTokenAndAdmin = (req, res, next) => {
//   verifyToken(req, res, () => {
//     if (req.user.isAdmin) {
//       next();
//     } else {
//       res.status(403).json("You are not alowed to do that!");
//     }
//   });
// };

// module.exports = {
//   verifyToken,
//   verifyTokenAndAuthorization,
//   verifyTokenAndAdmin,
// };
