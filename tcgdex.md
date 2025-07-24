# Utilisation de l'API TCGdex pour les cartes Pokémon FR 

https://tcgdex.dev/

## Accéder à toutes les cartes d’une extension en français

L’API TCGdex permet de récupérer toutes les cartes d’un set (extension) en français grâce à l’endpoint suivant :

```http
GET https://api.tcgdex.net/v2/fr/cards?set.id={set_id}
````

Par exemple, pour obtenir toutes les cartes de l’extension **Base Set (base1)** :

```http
GET https://api.tcgdex.net/v2/fr/cards?set.id=base1
```

### Résultat (extrait) :

```json
[
  {
    "id": "base1-1",
    "localId": "1",
    "name": "Alakazam",
    "image": "https://assets.tcgdex.net/fr/base/base1/1"
  },
  {
    "id": "base1-4",
    "localId": "4",
    "name": "Dracaufeu",
    "image": "https://assets.tcgdex.net/fr/base/base1/4"
  }
]
```

## Affichage des images en haute qualité

Les URLs retournées dans le champ `"image"` mènent au dossier de la carte mais **ne contiennent pas l’image complète**.
Pour afficher l’image de la carte en bonne taille (haute qualité), vous devez ajouter `/high.jpg` à la fin du chemin :

```
https://assets.tcgdex.net/fr/base/base1/4/high.jpg
```

### Exemple HTML d'affichage d'une carte

```html
<img src="https://assets.tcgdex.net/fr/base/base1/4/high.jpg" alt="Dracaufeu">
<p>Dracaufeu - ID: base1-4</p>
```

## Récapitulatif

* Utiliser `https://api.tcgdex.net/v2/fr/cards?set.id={set_id}` pour obtenir les cartes d’une extension.
* Ajouter `/high.jpg` à l’URL `image` pour obtenir l’image correcte.
* Le champ `name` fournit le nom FR de la carte.
* Le champ `localId` est le numéro de la carte dans le set.

## Notes supplémentaires

* La liste des `set.id` disponibles peut être obtenue via :

```http
GET https://api.tcgdex.net/v2/fr/sets
```

* Chaque set contient un identifiant (`id`) utilisable pour filtrer les cartes avec `?set.id=...`.

```

### 🔁 Étapes pour obtenir **toutes les URLs des extensions en français** :

1. **Ouvre ton navigateur ou Postman**
2. Appelle :

   ```
   https://api.tcgdex.net/v2/fr/sets
   ```
3. Tu obtiendras une liste JSON comme :

```json
[
  { "id": "base1", "name": "Set de Base" },
  { "id": "sv1", "name": "Écarlate & Violet 1" },
  { "id": "swsh1", "name": "Épée & Bouclier 1" },
]
```

4. Pour chaque ID (`base1`, `sv1`, `swsh1`, etc.), tu construis :

```http
https://api.tcgdex.net/v2/fr/cards?set.id=base1
https://api.tcgdex.net/v2/fr/cards?set.id=sv1
https://api.tcgdex.net/v2/fr/cards?set.id=swsh1
...
```

---

### 🛠️ Exemple script JS pour générer dynamiquement les URLs

```js
fetch("https://api.tcgdex.net/v2/fr/sets")
  .then(res => res.json())
  .then(data => {
    const urls = data.map(set => 
      `https://api.tcgdex.net/v2/fr/cards?set.id=${set.id}`
    );
    console.log(urls);
  });
```
