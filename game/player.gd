extends CharacterBody3D


const SPEED = 5.0
const JUMP_VELOCITY = 4.5
const MOUSE_SENSITIVITY = 0.002

@onready var camera: Camera3D = $Camera3D
@onready var pivot: Node3D = $Pivot


func _ready() -> void:
	# Capture mouse cursor for first person look
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	
	# Set camera to eye-level (1.6m high) and face straight forward
	if camera:
		camera.position = Vector3(0, 1.6, 0)
		camera.rotation = Vector3.ZERO
	
	# Hide third-person character mesh so it doesn't clip into our first-person camera
	if pivot:
		pivot.visible = false


func _unhandled_input(event: InputEvent) -> void:
	# Release mouse cursor on ESC, capture on click
	if event.is_action_pressed("ui_cancel"):
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	elif event is InputEventMouseButton and event.pressed:
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
		
	# Mouse look movement
	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		# Rotate body left/right (yaw)
		rotate_y(-event.relative.x * MOUSE_SENSITIVITY)
		
		# Rotate camera up/down (pitch)
		if camera:
			camera.rotate_x(-event.relative.y * MOUSE_SENSITIVITY)
			camera.rotation.x = clamp(camera.rotation.x, deg_to_rad(-89), deg_to_rad(89))


func _physics_process(delta: float) -> void:
	# Add the gravity.
	if not is_on_floor():
		velocity += get_gravity() * delta

	# Handle jump.
	if Input.is_action_just_pressed("ui_accept") and is_on_floor():
		velocity.y = JUMP_VELOCITY

	# Get the input direction and handle the movement/deceleration.
	var input_dir := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	var direction := (transform.basis * Vector3(input_dir.x, 0, input_dir.y)).normalized()
	
	if direction:
		velocity.x = direction.x * SPEED
		velocity.z = direction.z * SPEED
	else:
		velocity.x = move_toward(velocity.x, 0, SPEED)
		velocity.z = move_toward(velocity.z, 0, SPEED)

	move_and_slide()
