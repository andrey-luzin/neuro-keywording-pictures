#!/bin/bash

# Останавливаем скрипт, если произошла ошибка
set -e

# Переменные
IMAGE_NAME="neuro-keywording-pictures-app"
CONTAINER_NAME="neuro-keywording-pictures-container"
PORT="3000"

# Проверяем аргументы
if [ "$1" == "stop" ]; then
  echo "Останавливаем контейнер: $CONTAINER_NAME..."
  if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    docker stop $CONTAINER_NAME
  fi
  if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    docker rm $CONTAINER_NAME
  fi
  echo "Контейнер остановлен и удалён."
  exit 0
fi

# Шаг 1: Остановка и удаление старого контейнера, если он запущен
echo "Проверяем, запущен ли контейнер: $CONTAINER_NAME..."
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
  echo "Останавливаем старый контейнер..."
  docker stop $CONTAINER_NAME
fi
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
  echo "Удаляем старый контейнер..."
  docker rm $CONTAINER_NAME
fi

# Шаг 2: Удаление старого образа, если он существует
echo "Проверяем, существует ли старый образ: $IMAGE_NAME..."
if [ "$(docker images -q $IMAGE_NAME)" ]; then
  echo "Удаляем старый образ..."
  docker rmi $IMAGE_NAME
fi

# Шаг 3: Сборка нового Docker-образа
echo "Собираем новый Docker-образ: $IMAGE_NAME..."
docker build -t $IMAGE_NAME .

# Шаг 4: Запуск нового контейнера
echo "Запускаем новый контейнер: $CONTAINER_NAME..."
docker run -d -p $PORT:3000 --name $CONTAINER_NAME $IMAGE_NAME

# Шаг 5: Проверка
echo "Контейнер запущен: http://localhost:$PORT"
# docker ps | grep $CONTAINER_NAME