# data-viz

Antud veebirakenduse näol on tegemist TTÜ bakalaureuseõppe lõputööga.
Rakenduse tööle saamiseks lokaalselt on vaja esmalt installeerida NodeJS (LTS versioon), kättesaadav siit: https://nodejs.org/en/. Sellega tuleb kaasa käsurea käsk npm (node package manager). 
Järgmiseks on vaja installeerida Angular CLI. Seda saab teha käsureal (terminalis) käsuga "npm install -g @angular/cli" (ilma jutumärkideta).
Siis on vaja projekti kaustas(seal kus asub fail package.json) käivitada käsk "npm install" (installeerib vajalikud raamistikud ja teegid).
Server läheb käima käsuga "ng serve" (kui lisada parameeter --open, siis avab rakenduse automaatselt brauseris, vastasel juhul on rakendus kättesaadav aadressil http://localhost:4200).

Kui on vajadus graafi andmeid sisaldavate failide järel, siis on assets kaustas (/src/assets) olemas autori poolt kasutatud testfailid.

Veebirakendus on olemas töötaval kujul ka juba aadressil https://rasmussild.github.io/data-viz/
