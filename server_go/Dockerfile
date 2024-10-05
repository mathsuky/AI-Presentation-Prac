FROM golang:1.23-alpine3.20
RUN apk update && apk add git
RUN apk add --no-cache git gcc musl-dev mupdf mupdf-dev
WORKDIR /app
COPY /app/* ./
RUN go mod download
RUN go install github.com/air-verse/air@latest
EXPOSE 8080
CMD ["air", "-c", ".air.toml"]