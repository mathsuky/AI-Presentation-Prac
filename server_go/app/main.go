package main

import (
	"github.com/mathsuky/AI-Presentation-Prac/server_go/routes"

	"github.com/labstack/echo/v4"
)

func main() {

	server := echo.New()
	routes.RegisterRoutes(server)

	server.Logger.Fatal(server.Start(":8080"))
}
