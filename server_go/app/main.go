package main

import (
	"github.com/mathsuky/AI-Presentation-Prac/server_go/middleware"
	"github.com/mathsuky/AI-Presentation-Prac/server_go/routes"

	"github.com/labstack/echo/v4"
	echomiddleware "github.com/labstack/echo/v4/middleware"
)

func main() {
	server := echo.New()

	server.Use(echomiddleware.Logger())
	server.Use(echomiddleware.Recover())
	server.Use(middleware.CustomValidatorMiddleware())

	routes.RegisterRoutes(server)

	server.Logger.Fatal(server.Start(":8080"))
}
