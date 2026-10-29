// OPTIONAL. Put this in your Unity project with MMRoundEnded.jslib.
// Call MMWebPage.RoundEnded(); wherever a round finishes. Does nothing outside the web build.
using System.Runtime.InteropServices;

public static class MMWebPage
{
#if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")] private static extern void MM_RoundEnded();
    public static void RoundEnded() { MM_RoundEnded(); }
#else
    public static void RoundEnded() { }
#endif
}
