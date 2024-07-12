def get_seconds(duration: str):
    """
        Duration: "HH:MM:SS"
    """
    times = duration.split(':')
    seconds = 0
    power = 0
    for time in times[::-1]:
        try:
            seconds += int(time) * (60 ** power)
        except Exception as e:
            raise Exception(e)
        power += 1
            
    return seconds