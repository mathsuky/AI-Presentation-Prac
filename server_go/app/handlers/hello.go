package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type HelloRequest struct {
	Name string `json:"name" validate:"required"`
}

func GetHello(context echo.Context) error {
	return context.JSON(http.StatusOK, "Hello, World!")
}

func PostHello(context echo.Context) error {
	var req HelloRequest
	if err := context.Bind(&req); err != nil {
		return context.JSON(http.StatusBadRequest, "Invalid request")
	}

	if err := context.Validate(&req); err != nil {
		return context.JSON(http.StatusBadRequest, "Validation failed")
	}

	message := "Hello, " + req.Name + "!"
	return context.JSON(http.StatusOK, message)
}
