const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'orders.csv');
const CUSTOMERS_FILE = path.join(__dirname, 'customers.json');
const FAVORITES_FILE = path.join(__dirname, 'favorites.json');

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, 'タイムスタンプ,会社名,担当者名,メールアドレス,電話番号,用件,商品名1,型番1,数量1,商品名2,型番2,数量2,商品名3,型番3,数量3,商品名4,型番4,数量4,商品名5,型番5,数量5,納品先,納期希望,備考\n');
}

if (!fs.existsSync(CUSTOMERS_FILE)) {
  fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify({}));
}
if (!fs.existsSync(FAVORITES_FILE)) {
  fs.writeFileSync(FAVORITES_FILE, JSON.stringify({}));
}

const transporter = nodemailer.createTransporter({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'your-email@mac-exe.co.jp',
    pass: process.env.EMAIL_PASS || 'your-password'
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/submit', async (req, res) => {
  try {
    const data = req.body;
    const timestamp = new Date().toLocaleString('ja-JP');
    
    const csvLine = [
      timestamp,
      data.companyName || '',
      data.contactName || '',
      data.email || '',
      data.phone || '',
      data.purpose || '',
      data.product1 || '', data.model1 || '', data.quantity1 || '',
      data.product2 || '', data.model2 || '', data.quantity2 || '',
      data.product3 || '', data.model3 || '', data.quantity3 || '',
      data.product4 || '', data.model4 || '', data.quantity4 || '',
      data.product5 || '', data.model5 || '', data.quantity5 || '',
      data.deliveryLocation || '',
      data.deliveryDate || '',
      data.notes || ''
    ].map(item => `"${item}"`).join(',') + '\n';
    
    fs.appendFileSync(DATA_FILE, csvLine);
    
    if (data.email) {
      const customers = JSON.parse(fs.readFileSync(CUSTOMERS_FILE, 'utf8'));
      customers[data.email] = {
        companyName: data.companyName,
        contactName: data.contactName,
        phone: data.phone
      };
      fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(customers, null, 2));
    }
    
    if (data.email) {
      await transporter.sendMail({
        from: `マツモト産業 <${process.env.EMAIL_USER}>`,
        to: data.email,
        subject: '【受付完了】お問い合わせありがとうございます',
        text: `${data.companyName} ${data.contactName}様\n\nお問い合わせいただきありがとうございます。\n内容を確認次第、担当者よりご連絡させていただきます。\n\nマツモト産業株式会社\n京葉営業所`
      });
    }
    
    res.json({ success: true, message: '送信完了しました' });
  } catch (error) {
    console.error('エラー:', error);
    res.status(500).json({ success: false, message: 'エラーが発生しました' });
  }
});

app.get('/customer/:email', (req, res) => {
  try {
    const customers = JSON.parse(fs.readFileSync(CUSTOMERS_FILE, 'utf8'));
    const customer = customers[req.params.email];
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ message: '顧客が見つかりません' });
    }
  } catch (error) {
    res.status(500).json({ message: 'エラーが発生しました' });
  }
});

app.get('/favorites/:email', (req, res) => {
  try {
    const favorites = JSON.parse(fs.readFileSync(FAVORITES_FILE, 'utf8'));
    const userFavorites = favorites[req.params.email] || [];
    res.json(userFavorites);
  } catch (error) {
    res.status(500).json({ message: 'エラーが発生しました' });
  }
});

app.post('/favorites', (req, res) => {
  try {
    const { email, product } = req.body;
    const favorites = JSON.parse(fs.readFileSync(FAVORITES_FILE, 'utf8'));
    
    if (!favorites[email]) {
      favorites[email] = [];
    }
    
    if (favorites[email].length < 30) {
      favorites[email].push(product);
      fs.writeFileSync(FAVORITES_FILE, JSON.stringify(favorites, null, 2));
      res.json({ success: true });
    } else {
      res.status(400).json({ message: 'お気に入りは最大30件までです' });
    }
  } catch (error) {
    res.status(500).json({ message: 'エラーが発生しました' });
  }
});

app.get('/data.csv', (req, res) => {
  res.download(DATA_FILE);
});

app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
  console.log(`CSV出力URL: http://localhost:${PORT}/data.csv`);
});
