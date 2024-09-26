package routes

import (
	"github.com/labstack/echo/v4"
)

func RegisterRoutes(server *echo.Echo) {
	server.GET("/hello", getHello)
	server.POST("/hello", postHello)
}
