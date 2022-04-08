const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // nous extrayons le token du header Authorization de la requête entrante.
    const token = req.headers.authorization.split(" ")[1];
    // on utilise ensuite la fonction verify pour décoder le token qu'on vient de recevoir
    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
    // on prend l'ID utilisateur de notre token
    const userId = decodedToken.userId;
    // si la demande contient un ID utilisateur, on le compare à celui venant du token
    // s'il sont différents une érreur sera générée dans la console
    if (req.body.userId && req.body.userId !== userId) {
      return res.status(403).json({ error: "Utilisateur non trouvé !" });
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error("Invalid request!"),
    });
  }
};
