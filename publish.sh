#! /bin/bash

PACKAGE_VERSION=`node -p -e "require('./package.json').version"`

if [[ -z $1 ]]; then
  echo "请输入新的版本号 (当前版本 $PACKAGE_VERSION): "
  read VERSION
else
  VERSION=$1
fi

if [ $VERSION = $PACKAGE_VERSION ]; then 
  echo "版本号未改变，即将退出"
  exit 1
fi

read -p "确定当前版本 $VERSION - 发布Release吗? (y/n) " -n 1 -r

echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo
  echo "* * * * * * * 发布Release $VERSION 中* * * * * * *"
  echo

  # update package.json version to be used in the build
  npm version $VERSION --message "Release $VERSION"

  # build
  yarn build

  # push
  git push origin refs/tags/v$VERSION
  git push
  
  # publish
  npm publish --access=public
fi