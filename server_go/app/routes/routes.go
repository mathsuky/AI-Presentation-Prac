package routes

import (
	"github.com/labstack/echo/v4"
	"github.com/mathsuky/AI-Presentation-Prac/server_go/handlers"
)

func RegisterRoutes(e *echo.Echo) {
	e.GET("/hello", handlers.GetHello)
	e.POST("/hello", handlers.PostHello)
	e.POST("/pdf2img", handlers.Pdf2Img)
	e.GET("/download", handlers.DownloadFile)
}
