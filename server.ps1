$port = 8000
$rootFolder = $PSScriptRoot

$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $port)
$listener.Start()

Write-Host "Server running at http://localhost:$port/"
Write-Host "Press Ctrl+C to stop."

try {
    while ($true) {
        if ($listener.Pending()) {
            $client = $listener.AcceptTcpClient()
            $stream = $client.GetStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $writer = New-Object System.IO.StreamWriter($stream)
            
            # Read request line
            $requestLine = $reader.ReadLine()
            if ([string]::IsNullOrWhiteSpace($requestLine)) {
                $client.Close()
                continue
            }
            
            $method, $localPath, $protocol = $requestLine.Split(' ')
            
            # Read remaining headers (consume them)
            while ($true) {
                $header = $reader.ReadLine()
                if ([string]::IsNullOrWhiteSpace($header)) { break }
            }

            # Strip query string from localPath
            $localPath = $localPath -replace '\?.*$', ''

            if ($localPath -eq "/") {
                $localPath = "/index.html"
            }

            # Handle the path
            $filePath = Join-Path $rootFolder $localPath.Replace('/', '\')
            
            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = "text/plain"
                switch ($ext) {
                    ".html" { $contentType = "text/html; charset=UTF-8" }
                    ".css"  { $contentType = "text/css; charset=UTF-8" }
                    ".js"   { $contentType = "application/javascript; charset=UTF-8" }
                    ".json" { $contentType = "application/json; charset=UTF-8" }
                    ".png"  { $contentType = "image/png" }
                    ".svg"  { $contentType = "image/svg+xml; charset=UTF-8" }
                }
                
                $content = [System.IO.File]::ReadAllBytes($filePath)
                
                $writer.WriteLine("HTTP/1.1 200 OK")
                $writer.WriteLine("Content-Type: $contentType")
                $writer.WriteLine("Content-Length: " + $content.Length)
                $writer.WriteLine("Connection: close")
                $writer.WriteLine()
                $writer.Flush()
                
                $stream.Write($content, 0, $content.Length)
                $stream.Flush()
            } else {
                $errorBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $writer.WriteLine("HTTP/1.1 404 Not Found")
                $writer.WriteLine("Content-Type: text/plain; charset=UTF-8")
                $writer.WriteLine("Content-Length: " + $errorBytes.Length)
                $writer.WriteLine("Connection: close")
                $writer.WriteLine()
                $writer.Flush()
                
                $stream.Write($errorBytes, 0, $errorBytes.Length)
                $stream.Flush()
            }
            
            $client.Close()
        }
        else {
            Start-Sleep -Milliseconds 100
        }
    }
}
catch {
    Write-Host "Server stopped: $_"
}
finally {
    $listener.Stop()
}
