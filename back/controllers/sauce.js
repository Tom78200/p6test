const Sauce = require("../models/sauce");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => {
      res.status(200).json({
        message: "Sauce updated successfully!",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // nous devons ici récuperer le nom du fichier.
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Objet supprimé !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.createLikeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) //on récupère la sauce avec son id péesent dans le paramètre de la requête
    .then((sauce) => {
      //puis pour cette sauce si le corps de la requete est à un like
      let isLiked = false;
      if (req.body.like === 1) {
        console.log(req.body.like);
        sauce.usersLiked.forEach((element) => {
          //boucle du tableau usersLiked
          if (element == req.body.userId) {
            //si le userId du corps de la requete est dans le tableau
            isLiked = true;
          }
        });

        if (isLiked == false) {
          //si le userId du corps de la requete n'est pas dans le tableau, ajout au tableau et au compteur des likes
          Sauce.updateOne(
            { _id: sauce._id },
            {
              likes: sauce.likes + 1,
              $addToSet: { usersLiked: req.body.userId },
            }
          )
            .then(res.status(200).json(console.log("ok likes (donc +1)")))
            .catch((error) => res.status(400).json({ error }));
        }
      }

      //si le corps de la requete est like -1
      let isDisliked = false;
      if (req.body.like === -1) {
        sauce.usersDisliked.forEach((element) => {
          if (element == req.body.userId) {
            isDisliked = true;
          }
          console.log(element);
          console.log(req.body.userId);
        });
        if (isDisliked == false) {
          Sauce.updateOne(
            { _id: sauce._id },
            {
              dislikes: sauce.dislikes + 1,
              $addToSet: { usersDisliked: req.body.userId },
            }
          )
            .then(res.status(200).json(console.log("ok dislikes (donc +1)")))
            .catch((error) => res.status(400).json({ error }));
        }
      }
      //si le corps de la requete est like 0
      if (req.body.like === 0) {
        if (sauce.usersDisliked.includes(req.body.userId)) {
          Sauce.updateOne(
            { _id: sauce._id },
            {
              dislikes: sauce.dislikes - 1,
              $pull: { usersDisliked: req.body.userId },
            }
          )
            .then(
              res.status(200).json(console.log("dislikes annulé (donc -1)"))
            )
            .catch((error) => res.status(400).json({ error }));
        }
        if (sauce.usersLiked.includes(req.body.userId)) {
          Sauce.updateOne(
            { _id: sauce._id },
            { likes: sauce.likes - 1, $pull: { usersLiked: req.body.userId } }
          )
            .then(res.status(200).json(console.log("likes annulé (donc -1)")))
            .catch((error) => res.status(400).json({ error }));
        }
      }
    })
    .catch((error) => res.status(400).json({ error }));
};
