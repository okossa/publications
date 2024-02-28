import random
from enum import Enum
import curses
import math

class World:
    def __init__(self):
        self.width = 10 
        self.height = 20
        self.grid = [[0 for x in range(self.width)] for y in range(self.height)]

class Piece:
    def __init__(self) -> None:
        self.x = 0
        self.y = 0
        self.matrix = [[]] 

def compute_angle(rotation_angle: int) -> int:  
    cos = round(math.cos(rotation_angle))
    sin = round(math.sin(rotation_angle))

    if cos == 1 and sin == 0:
        rotation_angle = 0  # or 360

    if cos == 0 and sin == 1:
        rotation_angle = 90

    if cos == -1 and sin == 0:
        rotation_angle = 180

    if cos == 0 and sin == -1:
        rotation_angle = 270
    
    if(rotation_angle != 0 and rotation_angle != 90 and rotation_angle != 180 and rotation_angle != 270):
        rotation_angle = 0

    return rotation_angle

def rotate_matrix(matrix: list, rotation_angle: int) -> list:
    n = len(matrix)
    rotated_matrix = [[0 for _ in range(n)] for _ in range(n)]

    rotation_angle = compute_angle(rotation_angle)

    if rotation_angle == 0:
        return matrix

    for i in range(n):
        for j in range(n):
            if rotation_angle == 90:
                rotated_matrix[i][j] = matrix[n - j - 1][i]
            elif rotation_angle == 180:
                rotated_matrix[i][j] = matrix[n - i - 1][n - j - 1]
            elif rotation_angle == 270:
                rotated_matrix[i][j] = matrix[j][n - i - 1]
    
    return rotated_matrix


def get_world_coordinates_of_piece(piece: Piece, new_x: int, new_y: int, new_rotation_angle: int):
    matrix = rotate_matrix(piece.matrix, new_rotation_angle)

    world_coordinates = []
    
    for i in range(len(matrix)):
        for j in range(len(matrix[i])):
            if matrix[i][j] == 1:
                world_coordinates.append((new_x + j, new_y + i))

    return world_coordinates

def get_piece_shape(shape):
    if shape == "L":
        return [[0, 0, 0, 0], 
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 1, 0]]
    elif shape == "I":
        return [[0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]]
    elif shape == "J":
        return [[1, 0, 0, 0],
                [1, 1, 1, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]]
    elif shape == "O":
        return [[1, 1, 0, 0],
                [1, 1, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]]
    elif shape == "S":
        return [[0, 1, 1, 0],
                [1, 1, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]]
    elif shape == "Z":
        return [[1, 1, 0, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]]
    elif shape == "T":
        return [[0, 1, 0, 0],
                [1, 1, 1, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]]
    else:
        return None

def Generate_piece():
    piece = Piece()
    piece.x = 5
    piece.y = 0
    piece.rotation_angle = 0
    piece.matrix = get_piece_shape(random.choice(['L', 'I', 'J', 'O', 'S', 'Z', 'T']))
    return piece


def display(world: World, piece: Piece):
    stdscr = curses.initscr()
    stdscr.clear()
    piece_coordinates = get_world_coordinates_of_piece(piece, piece.x, piece.y, piece.rotation_angle)

    for i in range(len(world.grid)):
        for j in range(len(world.grid[i])):
            if world.grid[i][j] == 0:
                try:
                    stdscr.addch(i, j, ord("."))
                except (curses.error):
                    pass
            elif world.grid[i][j] == 1:
                try:
                    stdscr.addch(i, j, ord("#"))
                except (curses.error):
                    pass

    for x, y in piece_coordinates:
        try:
            stdscr.addch(y, x, ord("#"))
        except (curses.error):
            pass

    stdscr.refresh()
    curses.napms(100)  # Delay for 100 milliseconds

def get_requested_action(stdscr):
    key = stdscr.getch()
    if key == curses.KEY_LEFT:
        key = -1
        return TetrisUserAction.MOVE_LEFT
    elif key == curses.KEY_RIGHT:
        return TetrisUserAction.MOVE_RIGHT
    elif key == ord(' '):
        key = -1
        return TetrisUserAction.ROTATE
    
    return TetrisUserAction.IDLE

class TetrisUserAction(Enum):
    MOVE_LEFT = "move_left"
    MOVE_RIGHT = "move_right"
    ROTATE = "rotate"
    IDLE = "idle"

def execute_action(world: World, piece: Piece, action: TetrisUserAction):
    if action == TetrisUserAction.MOVE_LEFT:
        piece.x -= 1
    elif action == TetrisUserAction.MOVE_RIGHT:
        piece.x += 1
    elif action == TetrisUserAction.ROTATE:
        piece.rotation_angle += 90
    
    return world 

def check_action_possibility(world: World, piece: Piece, action: TetrisUserAction):
    if action == TetrisUserAction.MOVE_LEFT:
        new_piece_coordinates = get_world_coordinates_of_piece(piece, piece.x - 1, 
                                                               piece.y, piece.rotation_angle)
    elif action == TetrisUserAction.MOVE_RIGHT:
        new_piece_coordinates = get_world_coordinates_of_piece(piece, piece.x + 1, piece.y, 
                                                               piece.rotation_angle)
    elif action == TetrisUserAction.ROTATE:
        new_piece_coordinates = get_world_coordinates_of_piece(piece,piece.x, piece.y,
                                                               piece.rotation_angle + 90)
    else:
        new_piece_coordinates = get_world_coordinates_of_piece(piece, piece.x, piece.y, 
                                                               piece.rotation_angle)
    
    return is_configuration_valid(world, new_piece_coordinates)

def is_configuration_valid(world: World, piece_coordinates: list):
    for x, y in piece_coordinates:
            if x < 0 or x >= world.width or y < 0 or y >= world.height or world.grid[y][x] == 1:
                return False
    return True

def aggregate_piece_to_world(world: World, piece: Piece):
    piece_coordinates = get_world_coordinates_of_piece(piece, piece.x, piece.y, piece.rotation_angle)
    for x, y in piece_coordinates:
        world.grid[y][x] = 1
    return world

def apply_gravity(world: World, piece: Piece):
    is_new_piece_needed = False
    new_piece_coordinates = get_world_coordinates_of_piece(piece, piece.x, piece.y + 1, piece.rotation_angle)
    if is_configuration_valid(world, new_piece_coordinates):
        piece.y += 1
        return [world, is_new_piece_needed]
    else:
        aggregate_piece_to_world(world, piece)
        is_new_piece_needed = True
        return [world, is_new_piece_needed]

def count_how_many_full_lines(world: World):
    full_lines = 0
    for i in range(world.height):
        if all(world.grid[i]):
            full_lines += 1
    return full_lines

def remove_full_lines(world: World):
    for i in range(world.height):
        if all(world.grid[i]):
            del world.grid[i]
            world.grid.insert(0, [0 for x in range(world.width)])
    return world

def check_game_over(world: World, piece: Piece):
    piece_coordinates = get_world_coordinates_of_piece(piece, piece.x, piece.y, piece.rotation_angle)
    return not is_configuration_valid(world, piece_coordinates) and piece.y == 0

def TetrisGame():
    world = World()
    score = 0
    is_game_over = False
    is_new_piece_needed = False

    piece = Generate_piece()
       
    stdscr = curses.initscr()
    curses.cbreak()
    stdscr.keypad(True)
    stdscr.nodelay(True)

    while not is_game_over:
        
        if is_new_piece_needed:
            piece = Generate_piece()
            is_new_piece_needed = False

        action = get_requested_action(stdscr)       
        is_action_possible = check_action_possibility(world, piece, action) 

        if is_action_possible:
            world = execute_action(world, piece, action)

        result = apply_gravity(world, piece)
        world = result[0]
        is_new_piece_needed = result[1]

        score += count_how_many_full_lines(world)
        world = remove_full_lines(world) 
        is_game_over = check_game_over(world, piece)

        display(world, piece)
 
    curses.nocbreak()
    stdscr.keypad(False)
    curses.echo()
    curses.endwin()

    if is_game_over:
        print("Game Over")
        print("Your score is: ", score)
        pass

if __name__ == "__main__":
    TetrisGame()
