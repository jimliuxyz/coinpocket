# coinpocket

# 編譯與佈建合約
```sh
# 1.Remove the build folder
rm -r build/
truffle compile
truffle migrate

# 2.Use
truffle migrate --reset --all
```

# 測試合約 (Mocha testing)
```sh
# test all scripts of ./test
truffle test
```

# 環境建立過程紀錄
```sh
npm install -g truffle

# init your folder (folder must be totally empty!)
# or use a ready truffle box (metacoin)
truffle init

```

```sh
# generate package.json for builing evn
npm init
```

```sh
# prepare git

echo node_modules > .gitignore

git init
git add -A
git commit -m "first commit"
git remote add origin https://github.com/jimliuxyz/coinpocket.git
git push -u origin master
```

```sh
# install packages
npm i web3@0.19.0 truffle-contract@3.0.5 express body-parser morgan mongoose jsonwebtoken -S
```

