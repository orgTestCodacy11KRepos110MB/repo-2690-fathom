import contextlib
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

from click import command, option, Path


@command()
@option('--port', '-p', type=int, default=8000,
        help='The port to use (default: 8000)')
@option('--directory', '-d', type=Path(exists=True, file_okay=False), default=os.getcwd(),
        help='The directory to serve files from (default: current working directory')
def main(directory, port):
    """
    Serves the files in DIRECTORY over a local HTTP server: https://localhost:PORT.

    This is useful for vectorizing samples using FathomFox. FathomFox expects you to provide,
    in the vectorizer page, an address to an HTTP server that is serving your samples.
    """
    with cd(directory):
        server = HTTPServer(('localhost', port), SimpleHTTPRequestHandler)
        print(f'Serving {directory} over https://localhost:{port}.')
        print('Press Ctrl+C to stop.')
        server.serve_forever()


@contextlib.contextmanager
def cd(path):
    previous_directory = os.getcwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(previous_directory)
