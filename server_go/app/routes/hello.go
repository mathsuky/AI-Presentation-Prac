package routes

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func getHello(context echo.Context) error {
	return context.JSON(http.StatusOK, "Hello, World!")
}
