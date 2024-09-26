package routes

import (
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

type HelloRequest struct {
	Name string `json:"name" validate:"required"`
}

func getHello(context echo.Context) error {
	return context.JSON(http.StatusOK, "Hello, World!")
}

func postHello(context echo.Context) error {
	var req HelloRequest
	err := context.Bind(&req)
	if err != nil {
		return context.JSON(http.StatusBadRequest, "Invalid request")
	}

	// TODO:ミドルウェアについて勉強して書き換える
	validate := validator.New()
	err = validate.Struct(req)
	if err != nil {
		return context.JSON(http.StatusBadRequest, "Validation failed")
	}

	message := "Hello, " + req.Name + "!"
	return context.JSON(http.StatusOK, message)
}
