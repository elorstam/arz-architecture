from .domain import MachineInfo

def describe_machine(name: str, hostname: str, agent_version: str) -> MachineInfo:
    """Create a safe machine snapshot; hardware probing is a later phase."""
    return MachineInfo(name=name, hostname=hostname, os="unknown", agent_version=agent_version)
