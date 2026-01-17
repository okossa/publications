using TorchSharp;
using static TorchSharp.torch;

namespace GPTNet.Infrastructure;

/// <summary>
/// Manages hardware device selection for tensor operations.
/// Returns CUDA if available, otherwise falls back to CPU.
/// </summary>
public static class DeviceManager
{
    private static Device? _device;

    /// <summary>
    /// Gets the best available compute device (CUDA > CPU).
    /// </summary>
    public static Device GetDevice()
    {
        if (_device is not null)
            return _device;

        _device = cuda.is_available() ? CUDA : CPU;
        return _device;
    }

    /// <summary>
    /// Returns a human-readable description of the current device.
    /// </summary>
    public static string GetDeviceInfo()
    {
        var device = GetDevice();
        if (device.type == DeviceType.CUDA)
        {
            return $"CUDA (GPU available)";
        }
        return "CPU";
    }
}
