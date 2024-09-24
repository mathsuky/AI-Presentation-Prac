FROM golang:1.23-alpine3.20
RUN apk update && apk add git
WORKDIR /app
COPY /app/* ./
RUN go mod download
RUN go install github.com/air-verse/air@latest
EXPOSE 8080
CMD ["air", "-c", ".air.toml"]