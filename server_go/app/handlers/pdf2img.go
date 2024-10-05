package handlers

import (
	"fmt"
	"image/jpeg"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gen2brain/go-fitz"
	"github.com/labstack/echo/v4"
)

func saveFileToTemp(fileHeader *multipart.FileHeader) (string, error) {
	src, err := fileHeader.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()
	// 一時ファイルに保存しておく
	tempFile, err := os.CreateTemp("", "uploaded-*.pdf")
	if err != nil {
		return "", fmt.Errorf("failed to create temp file: %w", err)
	}

	if _, err := io.Copy(tempFile, src); err != nil {
		tempFile.Close()
		os.Remove(tempFile.Name())
		return "", fmt.Errorf("failed to save file: %w", err)
	}

	tempFile.Close()
	return tempFile.Name(), nil
}

func convertPageToImage(doc *fitz.Document, pageIndex int) (string, error) {
	img, err := doc.Image(pageIndex)
	if err != nil {
		return "", fmt.Errorf("failed to convert page to image: %w", err)
	}

	imgFile, err := os.CreateTemp("", fmt.Sprintf("image-%05d-*.jpg", pageIndex))
	if err != nil {
		return "", fmt.Errorf("failed to create image file: %w", err)
	}
	defer imgFile.Close()

	// 画像をJPEG形式で保存
	if err := jpeg.Encode(imgFile, img, &jpeg.Options{Quality: jpeg.DefaultQuality}); err != nil {
		return "", fmt.Errorf("failed to encode image: %w", err)
	}

	return imgFile.Name(), nil
}

func Pdf2Img(c echo.Context) error {
	form, err := c.MultipartForm()
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid form data"})
	}

	files := form.File["pdf"]
	if len(files) == 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "No PDF files uploaded"})
	}

	var allImages []string

	for _, file := range files {
		tempFileName, err := saveFileToTemp(file)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
		defer os.Remove(tempFileName)

		doc, err := fitz.New(tempFileName)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to read PDF"})
		}
		defer doc.Close()

		for i := 0; i < doc.NumPage(); i++ {
			imageFile, err := convertPageToImage(doc, i)
			if err != nil {
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
			}
			allImages = append(allImages, imageFile)
		}
	}

	return c.JSON(http.StatusOK, allImages)
}

func DownloadFile(c echo.Context) error {
	filePath := c.QueryParam("path")
	if filePath == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "File path is required"})
	}

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "File not found"})
	}

	fileName := filepath.Base(filePath)
	return c.Attachment(filePath, fileName)
}
