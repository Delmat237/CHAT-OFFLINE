# Assurez-vous d'avoir un fichier image (ex: profile.jpg) à la racine.
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: multipart/form-data" \
  -F "name=AZANGUE " \
  -F "email=azangueleonel9@gmail.com" \
  -F "password=password1234" \
  -F "role=student" \
  -F "photo=@./profile.jpg"


  # Connectez-vous et stockez le token JWT dans la variable $TOKEN
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "azangueleonel9@gmail.com",
    "password": "password1234"
  }' | jq -r '.token')

echo "Token stocké : $TOKEN"

# Si vous n'avez pas 'jq', vous pouvez simplement exécuter la commande 'curl' et copier/coller le token manuellement.