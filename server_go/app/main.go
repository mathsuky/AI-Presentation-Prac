package main

import (
	validatormiddleware "github.com/mathsuky/AI-Presentation-Prac/server_go/middleware"
	"github.com/mathsuky/AI-Presentation-Prac/server_go/routes"

	"github.com/labstack/echo/v4"
	echomiddleware "github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()

	e.Use(echomiddleware.Logger())
	e.Use(echomiddleware.Recover())
	e.Use(validatormiddleware.CustomValidatorMiddleware())

	e.Use(echomiddleware.CORSWithConfig(echomiddleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:5173", "http://localhost:5174"},
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE},
	}))

	routes.RegisterRoutes(e)

	e.Logger.Fatal(e.Start(":8080"))
}
